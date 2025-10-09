package com.project1.smart_diary.repository;

import com.project1.smart_diary.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession,Long> {
    ChatSession findByUser_EmailAndTitle(String email, String title);
    ChatSession findByTitle(String title);
    List<ChatSession> findByUser_Email(String email);
}
