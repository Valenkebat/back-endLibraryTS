import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Relation } from "typeorm"
import { Field, ObjectType } from 'type-graphql'
import { Book } from "./book.entity"

@ObjectType()
@Entity({name:'user'})
export class User {

    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field(() => String)
    @Column()
    fullName: string

    @Field()
    @Column()
    email: string

    @Field()
    @Column()
    password: string

    @Field(() => String)
    @CreateDateColumn({ type: 'timestamp'})
    createdAt: string

    @Field(() => Number)
    @Column({update:true,default:0})
    qBook: number

    @Field(() => [Book])
    @OneToMany(() => Book, (book) => book.userLoan, {nullable: true})
    books: Relation<Book[]>

}