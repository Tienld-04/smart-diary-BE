package com.project1.smart_diary.controller;


import com.project1.smart_diary.dto.request.DiaryRequest;
import com.project1.smart_diary.dto.request.DiarySearchByDateRequest;
import com.project1.smart_diary.dto.request.UpdateDiaryRequest;
import com.project1.smart_diary.dto.response.DiaryResponse;
import com.project1.smart_diary.service.DiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/diaries")
public class DiaryController {
    @Autowired
    private DiaryService diaryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiaryResponse> createDiary(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) throws IOException {
        DiaryRequest diaryRequest = new DiaryRequest();
        diaryRequest.setTitle(title);
        diaryRequest.setContent(content);
        DiaryResponse result = diaryService.createDiaryWithMedia(diaryRequest, images);
        return ResponseEntity.ok(result);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiaryResponse> updateDiary(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "imageIds", required = false) List<Long> imageIds,
            @RequestParam(value = "newImages", required = false) List<MultipartFile> newImages) throws IOException {
        UpdateDiaryRequest updateDiaryRequest = UpdateDiaryRequest.builder()
                .diaryId(id)
                .title(title)
                .content(content)
                .imageIdsDelete(imageIds)
                .build();
        DiaryResponse res = diaryService.updateDiary(updateDiaryRequest, newImages);
        return ResponseEntity.ok(res);
    }

    @GetMapping
    public ResponseEntity<List<DiaryResponse>> getAllDiaries() {
        List<DiaryResponse> diaries = diaryService.getAllDiaryByUserCurrent();
        return ResponseEntity.ok(diaries);
    }

    @GetMapping("/search/date")
    public ResponseEntity<List<DiaryResponse>> searchDiaryByDate(
            @RequestParam(value = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        DiarySearchByDateRequest diarySearchByDateRequest = new DiarySearchByDateRequest();
        diarySearchByDateRequest.setFromDate(fromDate);
        diarySearchByDateRequest.setToDate(toDate);
        return ResponseEntity.ok(diaryService.searchDiaryByDate(diarySearchByDateRequest));
    }
    @GetMapping("/search/emotion")
    public ResponseEntity<List<DiaryResponse>> searchDiaryByEmotion(@RequestParam(value = "emotion", required = false) String emotion){
        return  ResponseEntity.ok(diaryService.searchDiaryByEmotion(emotion));
    }
    @GetMapping("/search/keyword")
    public ResponseEntity<List<DiaryResponse>> searchDiaryByKeyword(
            @RequestParam("keyword") String keyword
    ) {
        return ResponseEntity.ok(diaryService.searchDiaryByKeyword(keyword));
    }

}