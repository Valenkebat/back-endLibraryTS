import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Relation, JoinColumn, BaseEntity } from "typeorm"
import { Author } from "./author.entity"
import { Field, ObjectType } from 'type-graphql'
import { User } from "./user.entity"

@ObjectType()
@Entity({name:'book'})
export class Book extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    readonly id!: number

    @Field()
    @Column()
    title: string

    @Field(() => Author)
    @ManyToOne(() => Author, (author) => author.books, { onDelete: 'CASCADE' })
    author: Relation<Author>

    @Field()
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: string

    @Field()
    @Column({ type: 'timestamp', default: null, nullable: true })
    loanAt?: string

    @Field()
    @Column({ default: false })
    isLoan: boolean

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.books, { nullable: true })
    @JoinColumn({ name: 'userLoanId' })
    userLoan?: Relation<User>
}


