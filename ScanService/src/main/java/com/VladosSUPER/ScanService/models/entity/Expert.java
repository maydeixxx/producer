package com.VladosSUPER.ScanService.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "experts")
public class Expert {
    //Expert columns
    @Id
    private UUID id;

    @Column(nullable = false)
    private String expertLink;

    @Column(nullable = false, unique = true)
    private String expertNickname;

    //Users columns
    @Column(nullable = false)
    private long coverage;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String targetAud;

    @Column(nullable = false)
    private List<String> needs;

    @Column(nullable = false)
    private List<String> levers;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Expert expert)) return false;
        return Objects.equals(expertNickname, expert.expertNickname);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(expertNickname);
    }
}
