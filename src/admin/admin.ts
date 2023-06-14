import { AppDataSource } from "../config/typeorm"
import { Book } from "../entity/book.entity"
import { emailer } from "../mailer/mailer"


export async function sendMail(
) {
    if (AppDataSource.hasMetadata(Book)) {
        const userMetadata: any = AppDataSource.getMetadata(Book)
        console.log(userMetadata)
        const bookRepository = AppDataSource.getRepository(Book)
        try {
            const books =  await bookRepository.find({
                select: {
                    id: true,
                    title: true,
                    loanAt: true,
                    createdAt: true,
                    isLoan: true
                },
                where: { isLoan: true },
                relations: {
                    userLoan: true,
                    author: true
                }
            })
            console.log(books)
            emailer.notifyAdmin(books)
        } catch (error) {
            throw new Error(error)
        }
    }
}