const Expenses = require('../models/expenses');
const Users = require('../models/users');
const mongoose = require('mongoose');
const UserServices=require('../services/userServices')
const S3services=require('../services/s3Services')
const fs = require('fs');
const path = require('path');


exports.addexpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;

        // Create the expense document
        const expense = new Expenses({
            amount: amount,
            description: description,
            category: category,
            userID: req.user.id,
        });

        // Save the expense document within the transaction
        const data = await expense.save({ session });

        const totalExpense = Number(req.user.totalExpense) + Number(amount);

        // Update the user's totalExpense within the transaction
        await Users.findByIdAndUpdate(
            req.user.id,
            { totalExpense: totalExpense },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.json({ data });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        res.status(500).json({ error: 'Failed to add expense' });
    }
};

const ITEMS_PER_PAGE = 3;


exports.getexpense = async (req, res, next) => {
    const page = +req.query.page || 1;
    const userId = req.user.id;

    try {
        const total = await Expenses.countDocuments({ userID: userId });

        const expenses = await Expenses.find({ userID: userId })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.json({
            expenses: expenses,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < total,
            nextPage: page + 1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: Math.ceil(total / ITEMS_PER_PAGE),
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

exports.delexpense = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!req.params.id) {
            console.log('id is missing');
            throw new Error('Expense ID is missing');
        }

        const id = req.params.id;

        const deletedExpense = await Expenses.findOneAndDelete({ _id: id, userID: req.user.id }).session(session);

        if (!deletedExpense) {
            throw new Error('Expense not found');
        }

        const totalExpense = Number(req.user.totalExpense) - Number(deletedExpense.amount);

        await Users.findByIdAndUpdate(req.user.id, { totalExpense: totalExpense },
            { session });

        await session.commitTransaction();
        session.endSession();

        res.sendStatus(200);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};


exports.downloadexpense = async (req, res, next) => {
    try {
        const expenses = await Expenses.find({ userID: req.user._id })
        console.log(expenses)
        const stringifiedexpense = JSON.stringify(expenses)
        console.log(stringifiedexpense)
        const uid = req.user.id
        const filename = `Expense${uid}/${new Date()}.txt`
        const fileURL = await S3services.uploadToS3(stringifiedexpense, filename)

        res.status(200).json({ fileURL, success: true })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ fileURL: '', success: false, error: err })
    }
}

