package com.datablau.reverse.engineering.worker.metamodeldemo;

import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectCreationWatcher;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.ProgressJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @program: datablau-datasource-plugins
 * @description:
 * @author: wang tong
 * @create: 2025-02-19 14:53
 **/
public class MetaModelDemoWorker extends ProgressJob implements ReverseForwardStrategy {

    private static final Logger LOGGER = LoggerFactory.getLogger(MetaModelDemoWorker.class);

    protected ReverseForwardOptions options;
    protected Datasource datasource;
    protected ReverseDelegator delegator;
    private IdGetter idGetter;
    private String modelName;
    protected Map<String, ReversedSchema> schemaMap = new ConcurrentHashMap<>();
    protected ModelX currentModel = null;
    protected ObjectCreationWatcher saver = null;
    protected boolean useProgressSave = false;

    @Override
    public ModelX reverseEngineer(ModelX modelX, Datasource datasource, ReverseForwardOptions reverseForwardOptions) throws ReverseEngineeringFailedException {

        //TODO  do something
        return modelX;
    }

    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "METAMODELDEMO";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
         return datasource.getType().equals(getType());
    }
}
