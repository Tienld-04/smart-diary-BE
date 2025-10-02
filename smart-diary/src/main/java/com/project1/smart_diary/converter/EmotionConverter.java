package com.project1.smart_diary.converter;

import com.project1.smart_diary.enums.Emotion;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EmotionConverter implements AttributeConverter<Emotion, String> {

    @Override
    public String convertToDatabaseColumn(Emotion emotion) {
        if (emotion == null) {
            return null;
        }
        return emotion.getDescription();
    }
    @Override
    public Emotion convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        for (Emotion e : Emotion.values()) {
            if (e.getDescription().equals(dbData)) {
                return e;
            }
        }
        throw new IllegalArgumentException("Unknown description: " + dbData);
    }
}
