package com.project1.smart_diary.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chat_messages")
public class ChatMessage extends BaseEntity {

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "is_user_message", nullable = false)
    private boolean isUserMessage;

    //    @ManyToOne
//    @JoinColumn(name = "user_id", nullable = false)
//    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session; // mỗi message thuộc về 1 session

}
