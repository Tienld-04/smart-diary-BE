package com.project1.smart_diary.repository.custom.impl;

import com.project1.smart_diary.dto.request.DiarySearchRequest;
import com.project1.smart_diary.entity.DiaryEntity;
import com.project1.smart_diary.enums.Emotion;
import com.project1.smart_diary.exception.ApplicationException;
import com.project1.smart_diary.exception.ErrorCode;
import com.project1.smart_diary.repository.custom.DiaryRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@Slf4j
public class DiaryRepositoryImpl implements DiaryRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    private Emotion mapKeywordToEmotion(String keyword) {
        if (keyword.trim().isEmpty() || keyword.isBlank()) {
            throw new ApplicationException(ErrorCode.EMOTION_NULL);
        }
        String inpEmotion = keyword.trim();
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

    @Override
    public List<DiaryEntity> findByKeyword(String email, String keyword) {
        StringBuilder jpql = new StringBuilder("select d from  DiaryEntity d where d.user.email = :email");
        if (keyword != null && !keyword.isBlank()) {
            jpql.append(" and (")
                    .append(" lower(d.title) like lower(concat('%', :keyword, '%'))")
                    .append(" or lower(d.content) like lower(concat('%', :keyword, '%'))")
                    .append(" or lower(d.advice) like lower(concat('%', :keyword, '%'))");
            Emotion emotion = mapKeywordToEmotion(keyword);
            if (emotion != null) {
                jpql.append(" or d.emotion = :emotion");
            }
            jpql.append(")");
        }
        TypedQuery<DiaryEntity> query = entityManager.createQuery(jpql.toString(), DiaryEntity.class);
        query.setParameter("email", email);
        if (keyword != null && !keyword.isBlank()) {
            query.setParameter("keyword", keyword);
            Emotion emotion = mapKeywordToEmotion(keyword);
            if (emotion != null) {
                query.setParameter("emotion", emotion);
            }
        }
        log.info("Java Persistence Query Language Search Keyword: {} ", jpql);
        List<DiaryEntity> result = query.getResultList();
        return result;
    }
    @Override
    public List<DiaryEntity> searchDiary(String email, DiarySearchRequest diarySearchRequest) {
        StringBuilder jpql = new StringBuilder("select d from DiaryEntity d where d.user.email = :email ");
        Map<String, Object> params = new HashMap<>();
        params.put("email", email);

        boolean hasCondition = false;

        if (diarySearchRequest.getEmotion() != null && !diarySearchRequest.getEmotion().trim().isEmpty()) {
            Emotion emotion = mapKeywordToEmotion(diarySearchRequest.getEmotion());
            jpql.append("and d.emotion = :emotion ");
            params.put("emotion", emotion);
            hasCondition = true;

        }
        LocalDateTime fromDate = null;
        LocalDateTime toDate = null;

        if (diarySearchRequest.getFromDate() != null) {
            fromDate = diarySearchRequest.getFromDate().atStartOfDay();
        }
        if (diarySearchRequest.getToDate() != null) {
            toDate = diarySearchRequest.getToDate().plusDays(1).atStartOfDay().minusNanos(1);
        }
        if (fromDate != null && toDate != null) {
            jpql.append("and d.createdAt between :fromDate and :toDate ");
            params.put("fromDate", fromDate);
            params.put("toDate", toDate);
            hasCondition = true;
        } else if (fromDate != null) {
            jpql.append("and d.createdAt >= :fromDate ");
            params.put("fromDate", fromDate);
            hasCondition = true;
        } else if (toDate != null) {
            jpql.append("and d.createdAt <= :toDate ");
            params.put("toDate", toDate);
            hasCondition = true;
        }
        if (diarySearchRequest.getKeyword() != null && !diarySearchRequest.getKeyword().trim().isEmpty()) {
            jpql.append("and (lower(d.title) like lower(:keyword) or lower(d.content) like lower(:keyword)) ");
            params.put("keyword", "%" + diarySearchRequest.getKeyword().trim().toLowerCase() + "%");
            hasCondition = true;
        }
        if (!hasCondition) {
            throw new ApplicationException(ErrorCode.SEARCH_DIARY_INVALID);
        }
        jpql.append("order by d.createdAt desc");

        TypedQuery<DiaryEntity> query = entityManager.createQuery(jpql.toString(), DiaryEntity.class);
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        log.info("JPQL Query Search: {}", jpql);
        return query.getResultList();
    }

}
