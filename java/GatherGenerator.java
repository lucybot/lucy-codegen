package io.swagger.codegen;

import java.io.IOException;
import java.io.File;
import java.util.Map;
import java.util.HashMap;

public class GatherGenerator extends DefaultGenerator {
  private Map<String, String> files = new HashMap<String, String>();

  @Override
  public File writeToFile(String filename, String contents) throws IOException {
    files.put(filename, contents);
    return null;
  }

  public Map<String, String> getFiles() {
    return files;
  }
}
