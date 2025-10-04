package com.project1.smart_diary.repository;

import com.project1.smart_diary.entity.DiaryEntity;
import com.project1.smart_diary.entity.UserEntity;
import com.project1.smart_diary.enums.Emotion;
import com.project1.smart_diary.repository.custom.DiaryRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntity,Long>, DiaryRepositoryCustom {
    List<DiaryEntity> findByUser(UserEntity user);
    List<DiaryEntity> findByUser_EmailAndCreatedAtBetween(String email, LocalDateTime fromDate, LocalDateTime toDate);
    List<DiaryEntity> findByUser_EmailAndCreatedAtAfter(String email, LocalDateTime fromDate);
    List<DiaryEntity> findByUser_EmailAndCreatedAtBefore(String email, LocalDateTime toDate);
    //List<DiaryEntity> findByUser_Email(String email);
    List<DiaryEntity> findByUser_EmailAndEmotion(String email, Emotion emotion);
    List<DiaryEntity> findByUser_EmailAndTitleContainingIgnoreCaseOrUser_EmailAndContentContainingIgnoreCase(
            String email1, String keyword1, String email2, String keyword2
    );
}
