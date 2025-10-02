package com.project1.smart_diary.service;

import com.project1.smart_diary.converter.DiaryConverter;
import com.project1.smart_diary.dto.response.DiaryMediaResponse;
import com.project1.smart_diary.entity.DiaryEntity;
import com.project1.smart_diary.entity.DiaryMedia;
import com.project1.smart_diary.repository.DiaryMediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiaryMediaService {
    private final DiaryMediaRepository diaryMediaRepository;
    private final DiaryConverter diaryConverter;

    @Transactional
    public void deleteDiaryMediaByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Danh sách id rỗng");
        }
        diaryMediaRepository.deleteByIdIn(ids);
    }

    public List<DiaryMediaResponse> getDiaryMediayByDiary(DiaryEntity diary) {
        List<DiaryMedia> diaryMedia = diaryMediaRepository.findByDiary(diary);
        List<DiaryMediaResponse> diaryMediaResponses = new ArrayList<>();
        for (DiaryMedia item : diaryMedia) {
            DiaryMediaResponse  diaryMediaResponse = diaryConverter.converToDiaryMediaResponse(item);
            diaryMediaResponses.add(diaryMediaResponse);
        }
        return diaryMediaResponses;
    }
}
