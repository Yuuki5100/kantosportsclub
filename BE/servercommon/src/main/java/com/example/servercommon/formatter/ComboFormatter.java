package com.example.servercommon.formatter;

import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.example.servercommon.responseModel.ComboResponse;

public class ComboFormatter {
    public static <T, V> List<ComboResponse<V>> format(
        List<T> list,
        Function<T, String> labelGetter,
        Function<T, V> valueGetter
    ) {
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }

        return list.stream()
            .map(item -> new ComboResponse<V>(labelGetter.apply(item), valueGetter.apply(item)))
            .collect(Collectors.toList());
    }
}
