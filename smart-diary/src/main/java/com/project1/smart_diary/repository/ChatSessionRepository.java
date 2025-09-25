package com.project1.smart_diary.repository;

import com.project1.smart_diary.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession,Long> {
}
