package com.datablau.ddd.server.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.ddd.server.service.api.NlqService;

@RestController
@RequestMapping("/nlq")
public class NlqController {

    @Autowired
    private NlqService nlqService;

    @GetMapping("/sentence")
    public List<String> getWordsBySentence(@RequestParam("sentence") String sentence) {
        List<String> sentences = nlqService.getWordsBySentence(sentence);
        List<String> result = new ArrayList<>();
        sentences.forEach(word -> {
            boolean isSimbol = false;
            if (word.length() == 1) {
                char[] words = word.toCharArray();
                // 判断是不是特殊符号
                if (!(words[0] >= 48 && words[0] <= 57) && !(words[0] >= 65 && words[0] <= 90)
                        && !(words[0] >= 97 && words[0] <= 122) && (words[0] < 0x4e00 || words[0] > 0x9fa5))
                    isSimbol = true;
            }
            if (!isSimbol)
                result.add(word);
        });
        return result;
    }
}
