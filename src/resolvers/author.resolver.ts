import { Mutation, Resolver, Arg, InputType, Field, Query } from "type-graphql";
import { Author } from "../entity/author.entity";
import { validate, MinLength, MaxLength } from "class-validator";
import { AppDataSource } from '../config/typeorm';

@InputType({ description: "New author data" })
class AuthorInput implements Partial<Author>{
    @Field()
    @MinLength(3, {
        message: 'Title is too short',
    })
    @MaxLength(64, {
        message: 'Title is too long',
    })
    fullName!: string
}

@InputType({ description: "Update author data" })
class AuthorUpdateInput implements Partial<Author>{

    @Field(() => Number)
    id!: number

    @MinLength(3, {
        message: 'Title is too short',
    })
    @MaxLength(64, {
        message: 'Title is too long',
    })
    @Field()
    fullName?: string
}

@InputType({ description: "Author data ID" })
class AuthorIdInput implements Partial<Author>{

    @Field()
    id!: number
}


@Resolver()
export class AuthorResolver {
    authorRepository = AppDataSource.getRepository(Author);

    @Mutation(() => Author)
    async createAuthor(
        @Arg("input", () => AuthorInput) input: AuthorInput
    ): Promise<Author> {
        try {
            const createAuthor = this.authorRepository.create({ fullName: input.fullName })
            const errors = await validate(createAuthor);
            if (errors.length > 0) {
                throw new Error();
            }
            return this.authorRepository.save(createAuthor);
        } catch (error) {
            throw new Error('Cannot create user with name' + input.fullName);
        }

    }

    @Query(() => [Author])
    async getAllAuthors(): Promise<Author[]> {
        return await this.authorRepository.find({
            relations: {
                books: true
            }
        })
    }

    @Query(() => Author)
    async getAuthorById(
        @Arg("input", () => AuthorIdInput) input: AuthorIdInput
    ): Promise<Author | undefined> {
        try {
            const author = await this.authorRepository.findOneBy({ id: input.id })
            if (!author) {
                const error = new Error()
                error.message = "Author does not exists"
                throw error
            }
            return author
        } catch (e) {
            throw new Error(e)
        }
    }

    @Mutation(() => Author)
    async updateOneAuthor(
        @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
    ): Promise<Author | undefined> {
        const authorExists = await this.authorRepository.findOneBy({ id: input.id })
        if (!authorExists) {
            throw new Error('Author ' + input.fullName + ' does not exosts')
        }
        await this.authorRepository.save({
            id: input.id,
            fullName: input.fullName
        })

        return await this.authorRepository.findOneBy({ id: input.id })
    }

    @Mutation(() => Boolean)
    async deleteOneAuthor(
        @Arg("input", () => AuthorIdInput) input: AuthorIdInput
    ): Promise<Boolean> {
        try {
            const authorExists = await this.authorRepository.findOneBy({ id: input.id })
            if (!authorExists) {
                throw new Error('Author does not exosts')
            }
            await this.authorRepository.delete({ id: input.id })
            return true
        } catch (error) {
            throw new Error(error.message)
        }
    }
}