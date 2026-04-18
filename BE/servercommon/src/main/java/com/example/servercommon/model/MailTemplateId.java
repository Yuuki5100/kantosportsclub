package com.example.servercommon.model;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class MailTemplateId implements Serializable {

    private String templateName;
    private String locale;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof MailTemplateId that))
            return false;
        return Objects.equals(templateName, that.templateName) &&
                Objects.equals(locale, that.locale);
    }

    @Override
    public int hashCode() {
        return Objects.hash(templateName, locale);
    }
}
