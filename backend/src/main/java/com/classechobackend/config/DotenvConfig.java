package com.classechobackend.config;

import io.github.cdimascio.dotenv.Dotenv;

public class DotenvConfig {

    static {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();

            // Set system properties from .env file
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
        } catch (Exception e) {
            // .env file not found or error loading - will use default values
            System.err.println("Warning: Could not load .env file. Using default configuration.");
        }
    }
}
