
import e from "express";
import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { Book } from "../entity/book.entity";
import { json } from "stream/consumers";


export class Emailer {
    private readonly transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_KEY,
            },
        });
    }

    public sendEmail(mailOptions: MailOptions) {
        return this.transporter.sendMail(mailOptions);
    }

    public notifyAdminForNewUser(email: string, username: string) {
        this.sendEmail(notifyAdminNewUserEmailTemplate(email, username));
    }

    public notifyUserForRegister(email: string, username: string) {
        this.sendEmail(newUserEmailTemplate(email, username));
    }

    public async notifyAdmin(books: Book[]) {
        this.sendEmail(notifyAdminStock(books))
    }
}

export const emailer = new Emailer();

export const newUserEmailTemplate = (email: string, username: string) => {
    return {
        from: process.env.GMAIL_USER,
        to: email,
        subject: `${username}, Welcome to the our website`,
        text: "Welcome to the our website",
        html: `
      <h1>Welcome to our website!</h1>
      <p>We're glad you've decided to join us. We hope you find everything you're looking for here and enjoy using our site.</p>
      <p>If you have any questions or need any help, please don't hesitate to contact us. Thank you for signing up!</p>
    `,
    } as MailOptions;
};

export const notifyAdminNewUserEmailTemplate = (
    email: string,
    username: string
) => {
    return {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: `New User: ${username} - email: ${email}`,
        text: `New User: ${username} - email: ${email}`,
        html: `
      <h1>New User: ${username}</h1>
      <p>email: ${email}</p>
    `,
    } as MailOptions;
};

export const notifyAdminStock = (
    books: Book[]
) => {
    let bodyTable: string = ''
    for (let index = 0; index < books.length; index++) {
        bodyTable +=
            `<tr>
            <td>${books[index].id}</td>
            <td>${books[index].title.valueOf()}</td>
            <td>${books[index].author.fullName.valueOf()}</td>
            <td>${books[index].userLoan.fullName.valueOf()}</td>
            <td>${books[index].userLoan.email}</td>
            <td>${books[index].loanAt}</td>
        </tr>`
    }
    return {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: `Stock update`,
        text: `New User: - email: `,
        html: `
        <table>
            <tr>
                <th>Book Id</th>
                <th>Book Title</th>
                <th>Book Author</th>
                <th>Loan To</th>
                <th>User Mail</th>
                <th>Loan at</th>
            </tr>
            <tbody>
                ${bodyTable}
            </tbody>
        </table>
    `,
    } as MailOptions;
};

export const notifyUserLoanExpiration = (
    email: string,
    username: string
) => {
    return {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: `Stock update`,
        text: `New User: ${username} - email: ${email}`,
        html: `
      <h1>New User: ${username}</h1>
      <p>email: ${email}</p>
    `,
    } as MailOptions;
};

