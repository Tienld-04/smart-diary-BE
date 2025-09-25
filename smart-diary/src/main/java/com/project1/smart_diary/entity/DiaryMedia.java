package com.project1.smart_diary.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "diary_media")
public class DiaryMedia extends BaseEntity {

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @ManyToOne
    @JoinColumn(name = "diary_id")
    private DiaryEntity diary;
}