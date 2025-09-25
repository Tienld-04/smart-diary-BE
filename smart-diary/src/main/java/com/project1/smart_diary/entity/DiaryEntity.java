package com.project1.smart_diary.entity;

import com.project1.smart_diary.converter.EmotionConverter;
import com.project1.smart_diary.enums.Emotion;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "diaries")
public class DiaryEntity extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String advice; //Lời khuyên từ AI

    @Convert(converter = EmotionConverter.class)
    private Emotion emotion; // Cảm Xúc

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiaryMedia> media;

}
