import { Column, Entity, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel";

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    body: string;

    // @Column({ nullable: false, type: "point" })
    // location: { x: number, y: number };

    @ManyToOne(type => Channel, channel => channel.posts, { onDelete: "SET NULL" })
    channel: Channel;

    @Column({ nullable: true })
    channelId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}