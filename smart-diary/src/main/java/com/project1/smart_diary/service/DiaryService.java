package com.project1.smart_diary.service;

import com.project1.smart_diary.converter.DiaryConverter;
import com.project1.smart_diary.dto.request.DiaryRequest;
import com.project1.smart_diary.dto.request.UpdateDiaryRequest;
import com.project1.smart_diary.dto.response.DiaryMediaResponse;
import com.project1.smart_diary.dto.response.DiaryResponse;
import com.project1.smart_diary.entity.DiaryEntity;
import com.project1.smart_diary.entity.DiaryMedia;
import com.project1.smart_diary.entity.UserEntity;
import com.project1.smart_diary.enums.Emotion;
import com.project1.smart_diary.exception.ApplicationException;
import com.project1.smart_diary.exception.ErrorCode;
import com.project1.smart_diary.repository.DiaryMediaRepository;
import com.project1.smart_diary.repository.DiaryRepository;
import com.project1.smart_diary.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.rmi.RemoteException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DiaryService {
    @Autowired
    private DiaryRepository diaryRepository;
    @Autowired
    private GeminiAPIService geminiAPIService;
    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private DiaryMediaRepository diaryMediaRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DiaryConverter diaryConverter;
    @Autowired
    private DiaryMediaService diaryMediaService;
    @Transactional
    public DiaryResponse createDiaryWithMedia(DiaryRequest req, List<MultipartFile> images) throws IOException {
        if(req.getTitle() == null || req.getTitle().equals("")) {
            throw new ApplicationException(ErrorCode.TITLE_NOT_NULL);
        }
        if(req.getContent() == null || req.getContent().equals("")) {
            throw new ApplicationException(ErrorCode.CONTENT_NOT_NULL);
        }
        Emotion emotion = geminiAPIService.predictTextEmotion(req.getContent());
        String advice = geminiAPIService.generateAdvice(req.getContent(), emotion);

        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        UserEntity userCurrent = userRepository.findByEmail(name);
        if (userCurrent == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_EXISTED);
        }

        DiaryEntity diary = DiaryEntity.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .emotion(emotion)
                .advice(advice)
                .user(userCurrent)
                .build();
        diary = diaryRepository.save(diary);
        DiaryMedia diaryMedia = new DiaryMedia();
        List<DiaryMediaResponse> diaryMediaResponseList = new ArrayList<>();
        if (images != null) {
            for (MultipartFile img : images) {
                Map up = cloudinaryService.uploadFile(img, "diary_images");
                String url = (String) up.get("secure_url");
               // mediaUrls.add(url);
                DiaryMedia media = DiaryMedia.builder()
                        .mediaUrl(url)
                        .diary(diary)
                        .build();
                diaryMedia = diaryMediaRepository.save(media);
                diaryMediaResponseList.add(diaryConverter.converToDiaryMediaResponse(diaryMedia));
            }
        }
        //DiaryMediaResponse diaryMediaResponse = diaryConverter.converToDiaryMediaResponse(diaryMedia);
        // Build response
        DiaryResponse res = DiaryResponse.builder()
                .id(diary.getId())
                .title(diary.getTitle())
                .content(diary.getContent())
                .emotion(diary.getEmotion())
                .advice(diary.getAdvice())
                .listMedia(diaryMediaResponseList)
                .build();

        return res;

//        List<String> mediaUrls = new ArrayList<>();
//        DiaryMedia diaryMedia;
//        List<DiaryMedia> diaryMediaList = new ArrayList<>();
//        if (images != null) {
//            for (MultipartFile img : images) {
//                Map up = cloudinaryService.uploadFile(img, "diary_images");
//                String url = (String) up.get("secure_url");
//                mediaUrls.add(url);
//                DiaryMedia media = DiaryMedia.builder()
//                        .mediaUrl(url)
//                        .build();
//                diaryMedia = diaryMediaRepository.save(media);
//                diaryMediaList.add(diaryMedia);
//            }
//        }
//        DiaryEntity diary = DiaryEntity.builder()
//                .title(req.getTitle())
//                .content(req.getContent())
//                .emotion(emotion)
//                .advice(advice)
//                .user(userCurrent)
//                .media(diaryMediaList)
//                .build();
//        diary = diaryRepository.save(diary);
//        DiaryResponse res = diaryConverter.converToDiaryResponse(diary);
//        return res;
    }
    @Transactional
    public DiaryResponse updateDiary(UpdateDiaryRequest req, List<MultipartFile> newImages) throws IOException {
        if(req.getTitle() == null || req.getTitle().equals("")) {
            throw new ApplicationException(ErrorCode.TITLE_NOT_NULL);
        }
        if(req.getContent() == null || req.getContent().equals("")) {
            throw new ApplicationException(ErrorCode.CONTENT_NOT_NULL);
        }
        DiaryEntity diary = diaryRepository.findById(req.getDiaryId()).orElseThrow(()-> new RuntimeException("Diary not found with id " + req.getDiaryId()));
        diary.setTitle(req.getTitle());
        if(!diary.getContent().equals(req.getContent())) {
            diary.setContent(req.getContent());
            Emotion emotion = geminiAPIService.predictTextEmotion(req.getContent());
            String advice = geminiAPIService.generateAdvice(req.getContent(), emotion);
            diary.setEmotion(emotion);
            diary.setAdvice(advice);

        }
        List<Long> imageIdsDelete = req.getImageIdsDelete();
        if(imageIdsDelete != null) {
            diaryMediaService.deleteDiaryMediaByIds(imageIdsDelete);
        }

        if (newImages != null) {
            for (MultipartFile img : newImages) {
                Map uploadResult = cloudinaryService.uploadFile(img, "diary_images");
                String url = (String) uploadResult.get("secure_url");
                DiaryMedia media = DiaryMedia.builder()
                        .mediaUrl(url)
                        .diary(diary)
                        .build();
                diaryMediaRepository.save(media);
            }
        }
        DiaryEntity res = diaryRepository.save(diary);
        List<DiaryMediaResponse> diaryMediaResponseList = diaryMediaService.getDiaryMediayByDiary(res);
        return DiaryResponse.builder()
                .id(res.getId())
                .title(res.getTitle())
                .content(res.getContent())
                .emotion(res.getEmotion())
                .advice(res.getAdvice())
                .listMedia(diaryMediaResponseList)
                .build();

    }
    public DiaryResponse findDiaryById(Long id) {
        DiaryEntity diary = diaryRepository.findById(id).get();
        DiaryResponse diaryResponse = diaryConverter.converToDiaryResponse(diary);
        return diaryResponse;
    }

    public List<DiaryResponse> getAllDiaryByUserCurrent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(username);
        if (user == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_EXISTED);
        }
        List<DiaryEntity> diaryEntityList = diaryRepository.findByUser(user);
        List<DiaryResponse> res = new ArrayList<>();
        for (DiaryEntity diaryEntity : diaryEntityList) {
            DiaryResponse diaryResponse = diaryConverter.converToDiaryResponse(diaryEntity);
            res.add(diaryResponse);
        }
        return res;
    }

}
