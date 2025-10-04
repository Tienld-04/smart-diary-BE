package com.project1.smart_diary.service;

import com.project1.smart_diary.converter.DiaryConverter;
import com.project1.smart_diary.dto.request.DiaryRequest;
import com.project1.smart_diary.dto.request.DiarySearchByDateRequest;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        if (req.getTitle() == null || req.getTitle().equals("")) {
            throw new ApplicationException(ErrorCode.TITLE_NOT_NULL);
        }
        if (req.getContent() == null || req.getContent().equals("")) {
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
        if (req.getTitle() == null || req.getTitle().equals("")) {
            throw new ApplicationException(ErrorCode.TITLE_NOT_NULL);
        }
        if (req.getContent() == null || req.getContent().equals("")) {
            throw new ApplicationException(ErrorCode.CONTENT_NOT_NULL);
        }
        DiaryEntity diary = diaryRepository.findById(req.getDiaryId()).orElseThrow(() -> new RuntimeException("Diary not found with id " + req.getDiaryId()));
        diary.setTitle(req.getTitle());
        if (!diary.getContent().equals(req.getContent())) {
            diary.setContent(req.getContent());
            Emotion emotion = geminiAPIService.predictTextEmotion(req.getContent());
            String advice = geminiAPIService.generateAdvice(req.getContent(), emotion);
            diary.setEmotion(emotion);
            diary.setAdvice(advice);

        }
        List<Long> imageIdsDelete = req.getImageIdsDelete();
        if (imageIdsDelete != null) {
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
                .createAt(res.getCreatedAt())
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

    public List<DiaryResponse> searchDiaryByDate(DiarySearchByDateRequest rq) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<DiaryEntity> diaryEntityList = new ArrayList<>();
        if (rq.getToDate() != null && rq.getFromDate() != null) {
            LocalDateTime fromDateTime = rq.getFromDate().atStartOfDay();
            LocalDateTime toDateTime = rq.getToDate().plusDays(1).atStartOfDay().minusNanos(1);
            diaryEntityList = diaryRepository.findByUser_EmailAndCreatedAtBetween(email, fromDateTime, toDateTime);
        } else if (rq.getFromDate() != null) {
            LocalDateTime fromDateTime = rq.getFromDate().atStartOfDay();
            diaryEntityList = diaryRepository.findByUser_EmailAndCreatedAtAfter(email, fromDateTime);
        } else if (rq.getToDate() != null) {
            LocalDateTime toDateTime = rq.getToDate().plusDays(1).atStartOfDay().minusNanos(1);
            diaryEntityList = diaryRepository.findByUser_EmailAndCreatedAtBefore(email, toDateTime);

        } else {
            throw new ApplicationException(ErrorCode.DATE_NULL);
        }
        if (diaryEntityList == null || diaryEntityList.isEmpty()) {
            throw new ApplicationException(ErrorCode.DIARY_NOT_FOUND);
        }
        List<DiaryResponse> res = new ArrayList<>();
        for (DiaryEntity diaryEntity : diaryEntityList) {
            DiaryResponse diaryResponse = diaryConverter.converToDiaryResponse(diaryEntity);
            res.add(diaryResponse);
        }
        return res;
    }

    private Emotion resolveEmotion(String emotion) {
        if (emotion == null || emotion.isBlank()) {
            throw new ApplicationException(ErrorCode.EMOTION_NULL);
        }
        String inpEmotion = emotion.trim();
        for (Emotion e : Emotion.values()) {
            String description = e.getDescription();
            String text = description.replaceAll("[^\\p{L}\\p{Z}]", "").trim();
            String icon = description.replaceAll("[\\p{L}\\p{Z}]", "").trim();
            if (inpEmotion.equalsIgnoreCase(description) || inpEmotion.equalsIgnoreCase(text) || inpEmotion.equals(icon)) {
                return e;
            }
        }
        return null;
    }

    public List<DiaryResponse> searchDiaryByEmotion(String inpEmotion) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (inpEmotion == null) {
            throw new ApplicationException(ErrorCode.EMOTION_NULL);
        }
        Emotion emotion = resolveEmotion(inpEmotion);
        List<DiaryEntity> diaries = diaryRepository.findByUser_EmailAndEmotion(email, emotion);
        if (diaries == null || diaries.isEmpty()) {
            throw new ApplicationException(ErrorCode.DIARY_NOT_FOUND);
        }
        return diaries.stream()
                .map(diaryConverter::converToDiaryResponse)
                .toList();
    }

    public List<DiaryResponse> searchDiaryByKeyword(String keyword) {
        if (keyword.equals("") || keyword.isBlank()) {
            throw new ApplicationException(ErrorCode.KEYWORD_NULL);
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
//        List<DiaryEntity> diaryEntityList = diaryRepository
//                .findByUser_EmailAndTitleContainingIgnoreCaseOrUser_EmailAndContentContainingIgnoreCase(email, keyword,email, keyword);
        List<DiaryEntity> diaryEntityList = diaryRepository.findByKeyword(email, keyword);
        if (diaryEntityList == null || diaryEntityList.isEmpty()) {
            throw new ApplicationException(ErrorCode.DIARY_NOT_FOUND);
        }
        return diaryEntityList.stream()
                .map(diaryConverter::converToDiaryResponse)
                .toList();
    }

    public List<DiaryResponse> getRecentDiary() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<DiaryEntity> diaryEntityList = diaryRepository.findTop3ByUser_EmailOrderByCreatedAtDesc(email);
        if (diaryEntityList == null || diaryEntityList.isEmpty()) {
            throw new ApplicationException(ErrorCode.DIARY_NOT_FOUND);
        }
        return diaryEntityList.stream().map(diaryConverter::converToDiaryResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteDiaryByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new ApplicationException(ErrorCode.IDS_DIARY_NULL);
        }
        diaryRepository.deleteByIdIn(ids);
    }

    public Map<LocalDate, Emotion> getEmotionByMonth(int year, int month) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDateTime fromDate = from.atStartOfDay();
        LocalDateTime toDate = from.plusMonths(1).atStartOfDay();
        List<DiaryEntity> diaryEntityList = diaryRepository.findByUser_EmailAndCreatedAtBetween(email, fromDate, toDate);
        //Nhóm cảm xúc theo ngày
        Map<LocalDate, List<DiaryEntity>> diariesByDay = diaryEntityList
                .stream().collect(Collectors.groupingBy(d -> d.getCreatedAt().toLocalDate()));
        System.out.println("diariesByDay: " + diariesByDay);
        Map<LocalDate, Emotion> res = new HashMap<>();
        for (Map.Entry<LocalDate, List<DiaryEntity>> entry : diariesByDay.entrySet()) {
            // Gom nhóm cảm xúc và đếm số luượng mỗi loại qua từng ngày
            Map<Emotion, Long> countMap = entry.getValue().stream()
                    .collect(Collectors.groupingBy(DiaryEntity::getEmotion, Collectors.counting()));
            if (countMap.isEmpty()) {
                res.put(entry.getKey(), null);
                continue;
            }
            long maxCnt = countMap.values().stream().mapToLong(Long::longValue).max().orElse(0);
            // Lấy danh sách cảm xúc có số lượng bằng maxCount
            List<Emotion> listEmotions = countMap.entrySet().stream()
                    .filter(e -> e.getValue() == maxCnt)
                    .map(Map.Entry::getKey)
                    .toList();
            Emotion emotion;
            if (listEmotions.size() == 1) {
                emotion = listEmotions.get(0);
            } else {
                emotion = Emotion.NEUTRAL;
            }
            res.put(entry.getKey(), emotion);
        }
        return res;
    }


}
