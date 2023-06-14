import { Mutation, Resolver, Arg, InputType, Field, Query, UseMiddleware, Ctx } from "type-graphql";
import { AppDataSource } from '../config/typeorm';
import { Book } from "../entity/book.entity";
import { Author } from "../entity/author.entity";
import { IsString, MaxLength, MinLength } from 'class-validator'
import { IContext, isAuth } from "../middlewares/auth.middleware";
import { User } from "../entity/user.entity";
import { Repository } from "typeorm";

@InputType()
class BookInput {

    @Field()
    @MinLength(3, {
        message: 'Title is too short',
    })
    @MaxLength(64, {
        message: 'Title is too long',
    })
    @IsString()
    title!: string
    @Field()
    author!: number
}

@InputType()
class BookUpdateInput {
    @Field(() => String, { nullable: true })
    @MinLength(3, {
        message: 'Title is too short',
    })
    @MaxLength(64, {
        message: 'Title is too long',
    })
    title?: string
    @Field(() => Number, { nullable: true })
    author?: number
}

@InputType()
class BookUpdateParseInput {
    @Field(() => String, { nullable: true })
    @MinLength(3, {
        message: 'Title is too short',
    })
    @MaxLength(64, {
        message: 'Title is too long',
    })
    title?: string
    @Field(() => Author, { nullable: true })
    author?: Author
}

@InputType()
class BookIdInput {
    @Field()
    id!: number
}


@InputType()
class BookupdateLoanParseInput {
    @Field()
    isLoan: boolean
    @Field()
    loanAt: string
    @Field(() => User)
    userLoan?: User
}

@InputType()
class UserUpdateLoanParseInput {
    @Field()
    id: number
    @Field()
    qBook: number
}

////////////////////////////////////////////////////////// RESOLVER /////////////////////////////////////////////////////////////////
export class bookRepository {
    bookRepository = AppDataSource.getRepository(Book)
    authorRepository = AppDataSource.getRepository(Author)
    userRepository = AppDataSource.getRepository(User)

    @Mutation(() => Book)
    @UseMiddleware(isAuth)
    async createBook(@Arg("input", () => BookInput, { validate: true }) input: BookInput, @Ctx() context: IContext) {
        try {
            console.log('Context from resolver', context)
            const authorInput: Author | undefined = await this.authorRepository.findOneBy({ id: input.author })
            console.log(context)
            if (!authorInput) {
                const error = new Error()
                error.message = 'The author does not exists'
                throw error
            }

            const book = await this.bookRepository.insert({
                title: input.title,
                author: authorInput
            })

            return await this.bookRepository.findOne({
                where: {
                    id: book.identifiers[0].id,
                },
                relations: {
                    author: true,
                },
            })
        } catch (errors) {
            throw new Error(errors.message)
        }
    }

    @UseMiddleware(isAuth)
    @Query(() => [Book])
    async getAllBooks(): Promise<Book[]> {
        try {
            return await this.bookRepository.find({
                relations: {
                    author: {
                        books: true
                    }
                }

            })
        } catch (error) {
            throw new Error(error)
        }
    }

    @UseMiddleware(isAuth)
    @Query(() => [Book])
    async getAllAvailableBooks(): Promise<Book[]> {
        try {
            return await this.bookRepository.find({
                select: { loanAt: false },
                where: { isLoan: false },
                relations: {
                    author: {
                        books: true
                    }
                }

            })
        } catch (error) {
            throw new Error(error)
        }
    }

    @Query(() => [Book])
    async getBooksOnLoan(): Promise<Book[]> {
        try {
            return await this.bookRepository.find({
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
        } catch (error) {
            throw new Error(error)
        }
    }

    @Query(() => Book)
    async getBookById(
        @Arg("input", () => BookIdInput) input: BookIdInput
    ): Promise<Book | undefined> {
        try {
            const book = await this.bookRepository.findOneBy({ id: input.id })
            if (!book) {
                const error = new Error()
                error.message = "Book does not exists"
                throw error
            }
            return book
        } catch (error) {
            throw new Error()
        }
    }

    @Mutation(() => Boolean)
    async updateBookById(
        @Arg('bookId', () => BookIdInput) bookId: BookIdInput,
        @Arg('input', () => BookUpdateInput) input: BookUpdateInput
    ): Promise<Boolean> {
        try {
            await this.bookRepository.update(bookId, await this.parseInput(input))
            return true
        } catch (e) {
            throw new Error(e)
        }
    }

    @Mutation(() => Boolean)
    async deleteBook(
        @Arg('bookId', () => BookIdInput) bookId: BookIdInput,
    ): Promise<Boolean> {
        try {
            const result = await this.bookRepository.delete(bookId)
            if (result.affected === 0) {
                throw new Error('Book does not exist')
            } else {
                return true
            }
        } catch (error) {
            throw new Error(error)
        }
    }


    @UseMiddleware(isAuth)
    @Mutation(() => Boolean)
    async loanBook(
        @Arg('bookId', () => BookIdInput) bookId: BookIdInput,
        @Ctx() context: IContext
    ): Promise<Boolean | undefined> {
        try {
            const book = await this.bookRepository.findOneBy({ id: bookId.id })
            if (!book) {
                const error = new Error()
                error.message = "Book does not exists"
                throw error
            }
            if (book.isLoan) {
                const error = new Error()
                error.message = "Book is loan"
                throw error
            }
            const userId = Number(context.payload.id)
            const user = await this.userRepository.findOneBy({ id: userId })
            if (user.qBook > 3) {
                const error = new Error()
                error.message = `User has 3 books sss`
                throw error
            }
            console.log('User: ', user)
            await this.bookRepository.update(bookId, await this.parseLoanBookInput(userId, false))
            await this.userRepository.update(userId, await this.parseLoanUserInput(userId, false))
            return true
        } catch (error) {
            throw new Error(error)
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => Boolean)
    async retunrLoanBook(
        @Arg('bookId', () => BookIdInput) bookId: BookIdInput,
        @Ctx() context: IContext
    ): Promise<Boolean | undefined> {
        try {
            const book = await this.bookRepository.findOneBy({ id: bookId.id })
            if (!book) {
                const error = new Error()
                error.message = "Book does not exists"
                throw error
            }
            const userId = Number(context.payload.id)
            const user = await this.userRepository.findOneBy({ id: userId, books: bookId })
            if (!user) {
                const error = new Error()
                error.message = "User has not this book"
                throw error
            }
            await this.bookRepository.update(bookId, await this.parseLoanBookInput(userId, true))
            await this.userRepository.update(userId, await this.parseLoanUserInput(userId, true))
            return true
        } catch (error) {
            throw new Error(error)
        }
    }


    ///////////////////////////////////////////////// Private Methods /////////////////////////////////////////////////////////////////////
    private async parseLoanBookInput(userId: number, isLoanBook: boolean) {
        try {
            const _input: BookupdateLoanParseInput = { isLoan: false, loanAt: '' }
            if (isLoanBook) {
                _input.userLoan = null
                _input.isLoan = false
                _input.loanAt = null
            } else {
                _input.userLoan = await this.userRepository.findOneBy({ id: userId })
                _input.isLoan = true
                let date: Date = new Date();
                _input.loanAt = String(date)
            }
            return _input
        } catch (error) {
            throw new Error(error)
        }
    }

    private async parseLoanUserInput(userId: number, isLoanBook: boolean) {
        try {
            const _input: UserUpdateLoanParseInput = { id: 0, qBook: 0 }

            const numBooks = (await this.userRepository.findOneBy({ id: userId })).qBook
            if (isLoanBook) {
                _input.id = null
                _input.qBook = numBooks - 1
            } else {
                _input.qBook = numBooks + 1
                _input.id = userId
            }
            return _input
        } catch (error) {
            throw new Error(error)
        }
    }

    private async parseInput(input: BookUpdateInput) {
        try {
            const _input: BookUpdateParseInput = {}
            if (input.title) {
                _input.title = input.title
            }
            if (input.author) {
                _input.author = await this.authorRepository.findOneBy({ id: input.author })
            }
            return _input
        } catch (error) {
            throw new Error(error)
        }
    }
}