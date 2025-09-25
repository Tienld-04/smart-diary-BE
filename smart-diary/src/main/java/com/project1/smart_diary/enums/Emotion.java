package com.project1.smart_diary.enums;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum Emotion {
    POSITIVE("Tích cực 😊"),
    NEGATIVE("Tiêu cực 😢"),
    NEUTRAL("Bình thường 😐"),
    ANXIOUS("Lo lắng 😟"),
    ANGRY("Tức giận 😡");

    private final String description;

    Emotion(String description) {
        this.description = description;
    }

    @com.fasterxml.jackson.annotation.JsonValue
    public String getDescription() {
        return description;
    }

    public static final Map<String, String> map = Stream.of(values())
                    .collect(Collectors.toMap(Enum::name, Emotion::getDescription));
}
