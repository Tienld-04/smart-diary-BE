package com.project1.smart_diary.repository;

import com.project1.smart_diary.entity.DiaryEntity;
import com.project1.smart_diary.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntity,Long> {
    List<DiaryEntity> findByUser(UserEntity user);
}
