const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const eitherService = require('../services/either.service');

/**
 * - Controller to create a new transaction
 * THE 10 - STEP TRANSACTION CREATION PROCESS
   * 1. Validate the request body to ensure all required fields are present and correctly formatted.
   * 2. Create account status.
   * 3. Check account status
   * 4. Derive sender balance from ledger
   * 5. Create transaction with status PENDING
   * 6. Create Debit ledger entry for sender account
   * 7. Create Credit ledger entry for receiver account
   * 8. Mark transaction as COMPLETED
   * 9. Commit MongoDB transaction
   * 10. Send email notification
 */



