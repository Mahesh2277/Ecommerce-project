const Transaction = require("../models/transactionModel");
const { sendFraudAlert } = require("../services/emailService");

exports.updateController = async(req, res)=>{
    try{
        const {transaction_id, ruleBasedResult, secondRouteResult} = req.body;
        const transaction = await Transaction.findOne({ transaction_id });
        if (!transaction) {
            console.log("Transaction not found!");
            return res.status(404).json({
                success: false,
                message: `Transaction not found`
            })
        }
        console.log("Original Transaction:", transaction);

        if(ruleBasedResult && secondRouteResult){
            const result = await Transaction.updateOne(
                { _id: transaction._id },
                { $set: { is_fraud: true } }
            );

            // Send fraud alert email
            if (result.modifiedCount > 0) {
                console.log(`Transaction ${transaction_id} marked as fraud! Sending email alert...`);
                
                const transactionDetails = {
                    transaction_id: transaction.transaction_id,
                    amount: transaction.amount,
                    payer_id: transaction.payer_id,
                    payee_id: transaction.payee_id,
                    ip: transaction.ip,
                    state: transaction.state,
                    fraud_score: 0.8, // Default high score for fraud
                    fraud_reason: 'Rule-based and ML model both detected fraud'
                };
                
                // Send email asynchronously (don't wait for it)
                sendFraudAlert(transactionDetails).catch(err => {
                    console.error('Failed to send fraud alert email:', err);
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Marked securely",
            transaction_id: transaction.transaction_id
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}