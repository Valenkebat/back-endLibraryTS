import { Arg, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { AppDataSource } from "../config/typeorm";
import { User } from '../entity/user.entity'
import { IsEmail, MaxLength, MinLength, validateOrReject } from "class-validator";
import { enviroment } from "../config/enviroment";
import pkg from 'bcryptjs';
import pkgJwt from "jsonwebtoken";
const { sign } = pkgJwt
const { hash, compareSync } = pkg;
import { emailer } from '../mailer/mailer';



@InputType()
class UserInput {
    @Field()
    @MinLength(3, {
        each: false,
        message: 'Name is too short',
    })
    @MaxLength(64, {
        each: false,
        message: 'Name is too long',
    })
    fullName: string

    @Field()
    @IsEmail()
    email: string

    @Field()
    @MinLength(8)
    @MaxLength(254)
    password: string
}
@InputType()
class LoginInput {
    @Field()
    @IsEmail()
    email: string

    @Field()
    password: string
}

@ObjectType()
class LoginResponse {
    @Field()
    userId: number

    @Field()
    jwt: string
}

@Resolver()
export class AuthResolver {
    userRepository = AppDataSource.getRepository(User);

    @Mutation(() => User)
    async register(
        @Arg('input', () => UserInput) input: UserInput
    ): Promise<User | undefined> {
        try {
            try {
                await validateOrReject(input);
                console.log('Validation succeeded');
            } catch (errors) {
                console.log('Validation failed');
                console.log(errors);
                throw errors
            }
            const { fullName, email, password } = input
            const userExist = await this.userRepository.findOne({ where: { email } })
            if (userExist) {
                const error = new Error()
                error.message = 'Email is not available'
                throw error
            }
            const hashPassword = await hash(password, 10)
            const newUser = await this.userRepository.insert({
                fullName,
                email,
                password: hashPassword,
            })
            emailer.notifyAdminForNewUser("valenkebat@gmail.com",fullName)
            emailer.notifyUserForRegister(email,fullName)
            return this.userRepository.findOneBy({ id: newUser.identifiers[0].id })

        } catch (error) {
            throw new Error(error)
        }
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg("input", () => LoginInput) input: LoginInput
    ) {
        try {
            const { email, password } = input
            const userExist = await this.userRepository.findOne({ where: { email } })
            if (!userExist) {
                const error = new Error()
                error.message = 'Invalid credentials'
                throw error
            }

            const isValidPassword: Boolean = compareSync(password, userExist.password)
            if (!isValidPassword) {
                const error = new Error()
                error.message = 'Invalid credentials'
                throw error
            }

            const jwt: string = sign({ id: userExist.id }, enviroment.JWT_SECRET)
            return {
                userId: userExist.id,
                jwt: jwt
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }
}