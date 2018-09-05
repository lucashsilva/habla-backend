import { Column, Entity, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    body: string;

    @Column({ nullable: false })
    lat: number;

    @Column({ nullable: false })
    lon: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}