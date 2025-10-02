package com.project1.smart_diary.repository;

import com.project1.smart_diary.entity.DiaryEntity;
import com.project1.smart_diary.entity.DiaryMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaryMediaRepository extends JpaRepository<DiaryMedia,Long> {
    void deleteByIdIn(List<Long> ids);
    List<DiaryMedia> findByDiary(DiaryEntity diary);
}
