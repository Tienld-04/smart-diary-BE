package com.project1.smart_diary.repository.custom;

import com.project1.smart_diary.entity.DiaryEntity;

import java.util.List;

public interface DiaryRepositoryCustom {
    List<DiaryEntity> findByKeyword(String email, String keyword);
}
