const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');

/**
 * - Controller to create a new transaction
 * THE 10 - STEP TRANSACTION CREATION PROCESS
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
     * 10. Send email notification
 */

async function createTransaction(req, res) {


  /**
   * - Step 1: Validate the request body to ensure all required fields are present and correctly formatted.
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "Missing required fields",
      status: "failed"
    });
  }

  const fromUserAccount = await accountModel.findOne({ 
    _id: fromAccount,
  })

  if(!fromUserAccount) {
    return res.status(404).json({
      message: "Sender account not found",
      status: "failed"
    });
  }

  const toUserAccount = await accountModel.findOne({ 
    _id: toAccount,
  })

  if(!toUserAccount) {
    return res.status(404).json({
      message: "Receiver account not found",
      status: "failed"
    });
  }

  /**
   *  - Validate the idempotency key to ensure that the transaction is not processed multiple times.
   */


  const isTransactionAlreadyExists = await transactionModel.findOne({ 
    idempotencyKey: idempotencyKey
   });

  if(isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
          message: "Transaction already processed",
          transaction: isTransactionAlreadyExists
      })
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
          message: "Transaction is still processing",
      })
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
        return res.status(500).json({
            message: "Transaction processing failed, please retry"
        })
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
        return res.status(500).json({
            message: "Transaction was reversed, please retry"
        })
    }
  }

  /**
   * - Check account status
   */
  
  if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
        message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
    })
}

/**
 * - Derive sender balance from ledger
 */

const balance = await fromUserAccount.getBalance();

if (balance < amount) {
  return res.status(400).json({
      message: `Insufficient balance in sender account . current balance is ${balance}. Required amount is ${amount}` 
  })

}
let transaction;
try{

/**
 * - Create transaction (PENDING)
 */

const session = await mongoose.startSession();

session.startTransaction();

const transaction = await transactionModel.create({
   
   fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING"


},{
   session
})

const debitLedgerEntry = await ledgerModel.create({
  
      account: fromAccount,
      type: "DEBIT",
      amount: amount,
      transaction: transaction._id
  },{
      session
    })

const creditLedgerEntry = await ledgerModel.create({
  
      account: toAccount,
      type: "CREDIT",
      amount: amount,
      transaction: transaction._id
},{
  session
})

transaction.status = "COMPLETED";
await transaction.save({ session });


await session.commitTransaction();
session.endSession();
}
catch(error){
  await session.abortTransaction();
  session.endSession();
  return res.status(500).json({
      message: "Transaction processing failed",
      error: error.message
  })
}
/**
 *  - Send email notification
 */

await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction
})

}




 


module.exports = {
  createTransaction
};