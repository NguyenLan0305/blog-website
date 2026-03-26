package com.group.blog.service;

import com.group.blog.dto.response.TagResponse;
import com.group.blog.entity.Tag;
import com.group.blog.repository.TagRepository;
import com.group.blog.util.SlugUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TagService {

    TagRepository tagRepository;

    public List<TagResponse> getAllTags() {
        List<Object[]> results = tagRepository.findAllTagsWithPostCount();

        return results.stream().map(row -> {
            Tag tag = (Tag) row[0];
            long postCount = (long) row[1];

            return TagResponse.builder()
                    .id(tag.getId())
                    .name(tag.getName())
                    // Không lưu DB, tự tạo Slug on-the-fly (chuẩn 3NF)
                    .slug(SlugUtils.generateSlug(tag.getName()) + "-" + tag.getId())
                    .postCount(postCount)
                    .build();
        }).toList();
    }
}