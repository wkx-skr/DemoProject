package com.datablau.domain.management.jpa.type;

public enum DomainStateExt {

    A("Accepted", 1),
    C("Candidate", 0),
    D("Development", -1),
    X("Expired", -1),
    N("NoState", -1),;

    private int stage;
    private String description;

    private DomainStateExt(String description, int stage) {
        this.description = description;
        this.stage = stage;
    }

    public String getDescription() {
        return this.description;
    }

    public int getStage() {
        return this.stage;
    }
}
