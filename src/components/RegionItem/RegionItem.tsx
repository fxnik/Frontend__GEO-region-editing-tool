import React, { FC, useState, useEffect } from "react";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { useActions } from "../../hooks/useActions";
import { IRegionItem } from "../../types/types";
import { IMapRegion } from "../../store/reducers/mapReducer";
import L from "leaflet";

import "./regionItemStyle.css";

//----------------------

const RegionItem: FC<IRegionItem> = ({ layer, info, region_id, signaler }) => {
  const {
    removeRegionItemAction,
    updateRegionItemInfoAction,
    CallChangeIndicatorFunctionAction,
    addCheckedElementIdAction,
    removeCheckedElementIdAction,
  } = useActions();

  const {
    mapPointer: map,
    currentRegionId,
    onMapRegions,
  } = useTypedSelector((state) => state.app);

  const [isOpend, setIsOpend] = useState(false);
  const [regionItemName, setRegionItemName] = useState("New element");
  const [isEditable, setIsEditable] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  //----------------------

  useEffect(() => {
    if (info) {
      setRegionItemName(info[1]);
    }
  }, []);

  //---------------------

  useEffect(() => {
    if (region_id === currentRegionId) {
      setIsEditable((state) => true);
    } else {
      setIsEditable((state) => false);
      setIsOpend((state) => false);
    }
  }, [currentRegionId]);

  //---------------------

  useEffect(() => {
    if (isChecked) {
      addCheckedElementIdAction(layer._leaflet_id);
    } else {
      removeCheckedElementIdAction(layer._leaflet_id);
    }
  }, [isChecked]);

  //---------------------

  const removeRegionItemHandler = (layer: any) => {
    let answer: boolean = window.confirm(
      "Are you sure you want to delete this item? "
    );
    if (!answer) return;

    CallChangeIndicatorFunctionAction();

    onMapRegions.forEach((obj: IMapRegion) => {
      if (obj.leaflet_id === currentRegionId) {
        obj.regionLayer.removeLayer(layer._leaflet_id);
      }
    });

    removeRegionItemAction(layer._leaflet_id);
  };

  const findRegionItemHandler = (layer: any) => {
    let itemType =
      layer instanceof L.Rectangle
        ? "Rectangle"
        : layer instanceof L.Polygon
        ? "Polygon"
        : layer instanceof L.Polyline
        ? "Polyline"
        : layer instanceof L.Circle
        ? "Circle"
        : "";

    if (itemType === "Polygon" || itemType === "Rectangle")
      map!.setView(layer._latlngs[0][0], map!.getZoom());

    if (itemType === "Polyline")
      map!.setView(layer._latlngs[0], map!.getZoom());

    if (itemType === "Circle") map!.setView(layer._latlng, map!.getZoom());
  };

  const setNewStyleRegionItemHandler = (layer: any) => {
    layer.setStyle({
      color: "red",
    });
  };

  const setPrevStyleRegionItemHandler = (layer: any) => {
    if (isChecked) {
      layer.setStyle({
        color: "#000000",
      });
    } else {
      layer.setStyle({
        color: "#3388ff",
      });
    }
  };

  //---------------------

  const setRegionItemNameHandler = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    signaler();
    updateRegionItemInfoAction([layer._leaflet_id, event.target.value]);
    setRegionItemName((state) => event.target.value);
  };

  //---------------------

  const elementCheckedHandler = () => {    
    setIsChecked((state) => !state);
  };

  //---------------------

  return (
    <div
      className="a__region-item"
      onMouseOver={() => setNewStyleRegionItemHandler(layer)}
      onMouseOut={() => setPrevStyleRegionItemHandler(layer)}
    >
      <div className="a__region-item-header">{regionItemName}</div>

      <div className="a__tool-panel">
        <div
          className="a__btn a__remove-btn"
          title="remove element"
          onClick={
            isEditable
              ? () => removeRegionItemHandler(layer)
              : () => alert("Start editing of this region")
          }
        >
          <i className="fas fa-trash-alt"></i>
        </div>

        <div
          className="a__btn a__find-element-btn"
          title="find the item on the map"
          onClick={
            isEditable
              ? () => findRegionItemHandler(layer)
              : () => alert("Start editing of this region")
          }
        >
          <i className="fas fa-search-location"></i>
        </div>

        <div
          className="a__btn a__pencil-btn"
          title="Add information about element"
          onClick={
            isEditable
              ? () => setIsOpend((state) => !state)
              : () => alert("Start editing of this region")
          }
        >
          <i className="fas fa-pencil-alt"></i>
        </div>

        <div className="a__cut-checkbox">
          <input
            type="checkbox"
            onChange={
              isEditable
                ? elementCheckedHandler
                : () => alert("Start editing of this region")
            }
            title="select this element to cut it out"
            disabled={isEditable ? false : true}
          />
        </div>
      </div>

      <div className={isOpend ? "a__comments a__opened" : "a__comments"}>
        <span>Information:</span>
        <textarea
          value={regionItemName}
          onChange={setRegionItemNameHandler}
          rows={3}
        />
      </div>
    </div>
  );
};

export default RegionItem;
