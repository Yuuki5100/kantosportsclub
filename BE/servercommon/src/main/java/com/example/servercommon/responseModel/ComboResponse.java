package com.example.servercommon.responseModel;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class ComboResponse<V> {
    private String label;
    private V value;

    public ComboResponse(String label, V value) {
        this.label = label;
        this.value = value;
    }

}
