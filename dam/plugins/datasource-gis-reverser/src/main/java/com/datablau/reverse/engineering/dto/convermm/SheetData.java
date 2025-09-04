package com.datablau.reverse.engineering.dto.convermm;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author: hxs
 * @date: 2025/4/21 16:16
 */
public class SheetData {
    private String sheet_name;
    private List<String> headers = new ArrayList<>();
    private List<List<Object>> data = new ArrayList<>();

    public SheetData(){}

    public SheetData(String sheet_name){
        this.sheet_name = sheet_name;
    }

    public String getSheet_name() {
        return sheet_name;
    }

    public void setSheet_name(String sheet_name) {
        this.sheet_name = sheet_name;
    }

    public List<String> getHeaders() {
        return headers;
    }

    public void setHeaders(List<String> headers) {
        this.headers = headers;
    }

    public List<List<Object>> getData() {
        return data;
    }

    public void setData(List<List<Object>> data) {
        this.data = data;
    }

    public void addHeader(String header){
        this.headers.add(header);
    }

    public void addData(List<Object> data){
        this.data.add(data);
    }
}
