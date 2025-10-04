package com.project1.smart_diary.repository.custom.impl;

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

import java.util.List;

@Repository
@Slf4j
public class DiaryRepositoryImpl implements DiaryRepositoryCustom {
    @PersistenceContext
    private EntityManager entityManager;

    private Emotion mapKeywordToEmotion(String keyword) {
        if (keyword.equals("") || keyword.isBlank()) {
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

}
