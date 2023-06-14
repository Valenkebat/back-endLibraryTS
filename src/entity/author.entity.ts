import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Relation } from "typeorm"
import { Book } from "./book.entity"
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class Author {

    @Field()
    @PrimaryGeneratedColumn()
    id: number

    @Field(() => String)
    @Column()
    fullName: string

    @Field(() => [Book])
    @OneToMany(() => Book, (book) => book.author, {nullable: true})
    books: Relation<Book[]>

    @Field(() => String)
    @CreateDateColumn({type: 'timestamp'})
    createdAt: string
}