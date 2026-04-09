package com.classechobackend.dto;

public class AuthRequest {
    private String supabaseToken;

    public AuthRequest() {
    }

    public AuthRequest(String supabaseToken) {
        this.supabaseToken = supabaseToken;
    }

    public String getSupabaseToken() {
        return supabaseToken;
    }

    public void setSupabaseToken(String supabaseToken) {
        this.supabaseToken = supabaseToken;
    }
}
