package com.example.servercommon.enums;

import java.util.Arrays;
import java.util.Optional;

public enum NotifyEventType {
    FILE_DOWNLOAD_COMPLETED("FILE_DOWNLOAD_COMPLETED"),
    GATE_IN("GATE_IN"),
    GATE_OUT("GATE_OUT"),
    REPORT_READY("REPORT_READY");

    private final String value;

    NotifyEventType(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static Optional<NotifyEventType> fromValue(String raw) {
        if (raw == null) {
            return Optional.empty();
        }
        return Arrays.stream(values())
                .filter(v -> v.value.equalsIgnoreCase(raw))
                .findFirst();
    }
}
