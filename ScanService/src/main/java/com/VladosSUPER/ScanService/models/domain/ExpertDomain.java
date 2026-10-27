package com.VladosSUPER.ScanService.models.domain;

import com.VladosSUPER.ScanService.models.domain.valueObjects.ExpertId;
import com.VladosSUPER.ScanService.models.domain.valueObjects.ExpertLink;
import com.VladosSUPER.ScanService.models.domain.valueObjects.ExpertNickname;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
public class ExpertDomain {
    private final ExpertId expertId;
    private ExpertLink expertLink;
    private ExpertNickname expertNickname;
    private long coverage;
    private String targetAud;
    private List<String> needs;
    private List<String> levers;

    public ExpertDomain(ExpertId expertId, ExpertLink expertLink, ExpertNickname expertNickname, long coverage, String targetAud, List<String> needs, List<String> levers) {
        if (coverage <= 0) throw new IllegalArgumentException("Provide correct coverage");
        if (targetAud == null || targetAud.isBlank()) throw new IllegalArgumentException("Text of target aud cant be null or blank");
        if (needs == null) needs = List.of();
        if (levers == null) levers = List.of();


        this.expertId = expertId;
        this.expertLink = expertLink;
        this.expertNickname = expertNickname;
        this.coverage = coverage;
        this.targetAud = targetAud;
        this.needs = new ArrayList<>(needs.stream().map(String::toLowerCase).toList());
        this.levers = new ArrayList<>(levers.stream().map(String::toLowerCase).toList());
    }

    public static ExpertDomain createExpert(String rawExpertLink, String rawExpertNickname, long coverage, String targetAud, List<String> needs, List<String> levers) {
        ExpertId expertId = ExpertId.generateId();
        ExpertLink expertLink = ExpertLink.of(rawExpertLink);
        ExpertNickname expertNickname = ExpertNickname.of(rawExpertNickname);

        return new ExpertDomain(expertId, expertLink, expertNickname, coverage, targetAud, needs, levers);
    }

    public static ExpertDomain restoreFromExisting(UUID rawId, String rawExpertLink, String rawExpertNickname, long coverage, String targetAud, List<String> needs, List<String> levers) {
        ExpertId expertId = new ExpertId(rawId);
        ExpertLink expertLink = ExpertLink.of(rawExpertLink);
        ExpertNickname expertNickname = ExpertNickname.of(rawExpertNickname);

        return new ExpertDomain(expertId, expertLink, expertNickname, coverage, targetAud, needs, levers);
    }

    public void updateExpertLink(String newExpertLink) {
        ExpertLink expertLink = ExpertLink.of(newExpertLink);
        if (this.expertLink.equals(expertLink)) throw new IllegalArgumentException("You cant provide the same link");

        this.expertLink = expertLink;
    }

    public void updateNickname(String newNickname) {
        ExpertNickname expertNickname = ExpertNickname.of(newNickname);
        if (this.expertNickname.equals(expertNickname)) throw new IllegalArgumentException("You cant provide the same nickname");

        this.expertNickname = expertNickname;
    }

    public void updateCoverage(long newCoverage) {
        if (newCoverage <= 0) throw new IllegalArgumentException("Coverage cant be zero");
        this.coverage = newCoverage;
    }

    public void updateTargetAudText(String newTargetAudText) {
        if (newTargetAudText == null) throw new IllegalArgumentException("New target aud text cant be null");
        this.targetAud = newTargetAudText;
    }

    public void addNewNeed(String newNeed) {
        if (newNeed == null || newNeed.isBlank()) throw new IllegalArgumentException("Provide correct new need");
        if (this.needs.contains(newNeed.toLowerCase())) throw new IllegalArgumentException("This need already added");
        this.needs.add(newNeed.toLowerCase());
    }

    public void removeNeed(String need) {
        if (need == null) throw new IllegalArgumentException("Need cant be null");
        this.needs.remove(need);
    }

    public void addNewLever(String newLever) {
        if (newLever == null || newLever.isBlank()) throw new IllegalArgumentException("Provide correct new lever");
        if (this.levers.contains(newLever.toLowerCase())) throw new IllegalArgumentException("This lever already added");
        this.levers.add(newLever.toLowerCase());
    }

    public void removeLever(String lever) {
        if (lever == null) throw new IllegalArgumentException("Lever cant be null");
        this.levers.remove(lever);
    }
}
