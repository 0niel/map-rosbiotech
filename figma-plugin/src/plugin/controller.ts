
type MapObjectType = 'room' | 'toilet' | 'canteen' | 'atm' | 'stairs';

type Campus = "В-78" | "В-86" | "С-20" | "МП-1"

interface MapObjectComponent {
  id: string;
  type: MapObjectType;
  name?: string;
  description?: string;
}


interface MapConfig {
  objectsComponents: MapObjectComponent[];
}

const mapConfig: MapConfig = {
  objectsComponents: []
};


figma.ui.onmessage = (msg) => {
  console.log('[onmessage]', msg);

  try {
    const { type } = msg;

    switch (type) {
      case "object-add":
        const { object } = msg;
        updateMapConfigByNewObjectData(object);
        sendConfigToUI();
        break;
      case "load-config":
        const { config } = msg;
        updateMapConfigFromJson(config);
        sendConfigToUI();
        break;
      case "map-components":
        const { campus } = msg;
        mapSvgComponents(campus);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[onmessage]", error);
  }
}

function uint8ArrayToString(fileData: Uint8Array) {
  var dataString = "";
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  return dataString;
}

function getMapObjectByNode(node: SceneNode) {
  const instance = node as InstanceNode;
  const instanceId = instance.mainComponent?.id;
  const mapObject = mapConfig.objectsComponents.find(object => object.id === instanceId);

  return mapObject;
}

function convertNodeNames(nodes: readonly SceneNode[], campus: string) {
  nodes.forEach(node => {
    if (node.type === "INSTANCE") {
      const mapObject = getMapObjectByNode(node);
      if (mapObject) {
        const newName = getNewNodeName(node, mapObject, campus);
        if (newName) {
          node.name = newName;
        }
      }
    }

    if (node.type === "FRAME") {
      const children = node.children;
      const instanceChild = children.find(child => child.type === "INSTANCE");
      if (instanceChild) {
        const mapObject = getMapObjectByNode(instanceChild);
        if (mapObject) {
          const newName = getNewNodeName(node, mapObject, campus);
          if (newName) {
            node.name = newName;
          }
        }
      }
    }
  });
}

function getShorNameForMapObectType(type: MapObjectType) {
  switch (type) {
    case "room":
      return "r";
    case "toilet":
      return "t";
    case "canteen":
      return "c";
    case "atm":
      return "a";
    case "stairs":
      return "s";
    default:
      return "r";
  }
}

function getTextByChildren(node: SceneNode) {
  const textByChildren: string[] = [];
  if ("children" in node) {
    node.children.forEach(childNode => {
      if ("characters" in childNode && childNode.visible) {
        if (childNode.characters.match(/[a-zA-Zа-яА-Я0-9]/g) && childNode.characters.length != 1) {
          textByChildren.push(childNode.characters);
        }
      }
    });
  }
  return textByChildren.join(" ");
}


function getNewNodeName(node: SceneNode, mapObject: MapObjectComponent, campus: string) {
  const typeShortName = getShorNameForMapObectType(mapObject.type);

  if (mapObject.name) {
    return `${campus}__${typeShortName}__${mapObject.name}`;
  }

  const textByChildren = getTextByChildren(node);

  if (textByChildren.length === 0) {
    return null;
  }

  return `${campus}__${typeShortName}__${textByChildren}`;
}

function decodeIds(svg: string) {
  svg = svg.replace(/id="([^"]+)"/g, (match, p1) => {
    if (p1.includes("__")) {
      return `data-room="${p1}"`;
    } else {
      return "";
    }
  });
  svg = svg.replace(/&#(\d+);/g, function (match, p1) {
    return String.fromCharCode(parseInt(p1));
  });
  svg = svg.replace(/data-room="([^"]+)"/g, function (match, p1) {
    return 'data-room="' + decodeURIComponent(escape(p1)) + '"';
  });

  return svg;
}

function mapSvgComponents(campus: string) {
  let selectedNodes = figma.currentPage.selection;
  if (selectedNodes.length === 1 && selectedNodes[0].type === "GROUP" || selectedNodes[0].type === "FRAME") {
    if (selectedNodes[0].children.length < 5) {
      selectedNodes = selectedNodes[0].children;
    } else {
      const getInstances = (node: SceneNode) => {
        if (node.type === "INSTANCE") {
          return [node];
        }

        if ("children" in node) {
          return node.children.reduce((acc, child) => {
            return [...acc, ...getInstances(child)];
          }, [] as SceneNode[]);
        }

        return [] as SceneNode[];
      }

      selectedNodes = getInstances(selectedNodes[0]);
    }
  }

  if (selectedNodes.length === 0) {
    figma.notify("Вы должны выбрать хотя бы один компонент");
    return;
  }

  convertNodeNames(selectedNodes, campus);
}


figma.on("selectionchange", () => {
  const { selection } = figma.currentPage;

  if (!selection || selection.length !== 1)
    return;

  if (selection[0].type === "INSTANCE") {
    const instance = selection[0] as InstanceNode;

    figma.ui.postMessage({ type: "instance-selected", message: { id: instance.mainComponent?.id, instances: instance.mainComponent?.instances.length } });
  }

  else if (selection[0].type === "COMPONENT") {
    const component = selection[0] as ComponentNode;

    figma.ui.postMessage({ type: "instance-selected", message: { id: component.id, instances: component.instances.length } });
  }

  figma.ui.postMessage({ type: "nodes-selected", message: { selected: selection.length > 0 } });
});


const updateMapConfigByNewObjectData = (objectData: any) => {
  const type = objectData.type as MapObjectType;
  const { id, name, description } = objectData;

  const mapObject = {
    id,
    type,
    name,
    description
  };

  // Обновляем по id или добавляем новый объект
  const index = mapConfig.objectsComponents.findIndex(object => object.id === id);
  if (index !== -1) {
    mapConfig.objectsComponents[index] = mapObject;
  } else {
    mapConfig.objectsComponents.push(mapObject);
  }

}

const updateMapConfigFromJson = (json: string) => {
  const config = JSON.parse(json);

  mapConfig.objectsComponents = config.objectsComponents;

}

const sendConfigToUI = () => {
  figma.ui.postMessage({ type: "config-updated", message: { config: mapConfig } });
}

figma.showUI(__html__, { width: 400, height: 600 });