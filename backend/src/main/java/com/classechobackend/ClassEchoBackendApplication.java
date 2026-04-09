package com.classechobackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.classechobackend.config.DotenvConfig;

@SpringBootApplication
@EnableScheduling
public class ClassEchoBackendApplication {

    static {
        new DotenvConfig();
    }

    public static void main(String[] args) {
        SpringApplication.run(ClassEchoBackendApplication.class, args);
    }

}
