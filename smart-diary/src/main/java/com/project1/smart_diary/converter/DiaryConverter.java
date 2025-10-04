package com.project1.smart_diary.converter;

import com.project1.smart_diary.dto.request.DiaryRequest;
import com.project1.smart_diary.dto.response.DiaryMediaResponse;
import com.project1.smart_diary.dto.response.DiaryResponse;
import com.project1.smart_diary.entity.DiaryEntity;
import com.project1.smart_diary.entity.DiaryMedia;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DiaryConverter {
    @Autowired
    private ModelMapper modelMapper;

    public DiaryEntity converToDiaryEntity(DiaryRequest diaryRequest) {
        DiaryEntity diary = modelMapper.map(diaryRequest, DiaryEntity.class);
        return diary;
    }

    public DiaryMediaResponse converToDiaryMediaResponse(DiaryMedia diaryMedia) {
        DiaryMediaResponse diaryMediaResponse = modelMapper.map(diaryMedia, DiaryMediaResponse.class);
        diaryMediaResponse.setId(diaryMedia.getId());
        diaryMediaResponse.setImageUrl(diaryMedia.getMediaUrl());
        return diaryMediaResponse;
    }

    public DiaryResponse converToDiaryResponse(DiaryEntity diaryEntity) {
        DiaryResponse diaryResponse = modelMapper.map(diaryEntity, DiaryResponse.class);
        diaryResponse.setCreateAt(diaryEntity.getCreatedAt());
        List<DiaryMedia> diaryMedia = diaryEntity.getMedia();
        List<DiaryMediaResponse> diaryMediaResponseList = new ArrayList<>();
        if (diaryMedia == null) {
            diaryMediaResponseList = null;
        } else {
            for (DiaryMedia diaryMediaItem : diaryMedia) {
                DiaryMediaResponse res = converToDiaryMediaResponse(diaryMediaItem);
                diaryMediaResponseList.add(res);
            }
        }
        diaryResponse.setListMedia(diaryMediaResponseList);
        return diaryResponse;
    }
}
