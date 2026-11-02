package com.VladosSUPER.ScanService.models.dtos;

public record InstagramPost(
        String caption,
        Integer likesCount,
        Integer commentsCount,
        Long videoPlayCount,
        Long videoViewCount,
        String ownerUsername
) {}