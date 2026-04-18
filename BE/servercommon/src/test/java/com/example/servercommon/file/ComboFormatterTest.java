package com.example.servercommon.file;

import com.example.servercommon.formatter.ComboFormatter;
import com.example.servercommon.responseModel.ComboResponse;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ComboFormatterTest {

    @Test
    void formatReturnsEmptyListWhenInputIsNull() {
        List<ComboResponse<Integer>> result = ComboFormatter.format(null, Object::toString, Object::hashCode);
        assertThat(result).isEmpty();
    }

    @Test
    void formatReturnsEmptyListWhenInputIsEmpty() {
        List<ComboResponse<Integer>> result = ComboFormatter.format(Collections.emptyList(), Object::toString, Object::hashCode);
        assertThat(result).isEmpty();
    }

    @Test
    void formatTransformsListCorrectly() {
        // テスト用クラス
        class Item {
            String name;
            int id;
            Item(String name, int id) { this.name = name; this.id = id; }
        }

        List<Item> items = Arrays.asList(
            new Item("A", 1),
            new Item("B", 2),
            new Item("C", 3)
        );

        List<ComboResponse<Integer>> result = ComboFormatter.format(
            items,
            item -> item.name,
            item -> item.id
        );

        assertThat(result).hasSize(3);

        assertThat(result.get(0).getLabel()).isEqualTo("A");
        assertThat(result.get(0).getValue()).isEqualTo(1);

        assertThat(result.get(1).getLabel()).isEqualTo("B");
        assertThat(result.get(1).getValue()).isEqualTo(2);

        assertThat(result.get(2).getLabel()).isEqualTo("C");
        assertThat(result.get(2).getValue()).isEqualTo(3);
    }
}
