import { Column, Entity, BaseEntity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity()
export class Channel extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ unique: true })
    name: string;

    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;
}