import json
import os
import shutil

# Configuration
INPUT_FILE = 'd:/AJDF/student explorer/client/public/input_data.json'
OUTPUT_DIR = 'd:/AJDF/student explorer/client/public/data'

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def save_json(data, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Saved: {filename}")

def transform_node(raw_node, node_id, label, parent_id=None):
    """
    Normalizes a node and identifies its children.
    """
    node = {
        "id": node_id,
        "label": label, # Standardize name/title to label
        # Preserve other properties
        **{k: v for k, v in raw_node.items() if k not in ["id", "name", "title", "main_fields", "degree_types", "branches", "career_streams", "children"]}
    }
    
    if parent_id:
        node["parentId"] = parent_id

    # Identify children from various possible keys
    children = []
    
    # Check for different children keys in order of hierarchy
    if "main_fields" in raw_node:
        children = raw_node["main_fields"]
    elif "degree_types" in raw_node:
        children = raw_node["degree_types"]
    elif "branches" in raw_node:
        children = raw_node["branches"]
    elif "career_streams" in raw_node:
        children = raw_node["career_streams"]
    elif "children" in raw_node:
        children = raw_node["children"]
        
    return node, children

def process_and_split(raw_node, node_id, label, parent_id=None):
    """
    Recursively processes nodes, splits them into files, and returns a 'lazy' reference node.
    """
    node_data, children_data = transform_node(raw_node, node_id, label, parent_id)
    
    processed_children = []
    
    # If there are children, process them
    if children_data:
        for child in children_data:
            # Determine ID and Label for child
            child_id = child.get("id")
            if not child_id:
                # Fallback if no ID (shouldn't happen with this dataset but good safety)
                child_id = f"{node_id}_{len(processed_children)}"
            
            child_label = child.get("name", child.get("title", child_id))
            
            # Recursively process child
            # The child returns a "lazy" version of itself to be included in CURRENT file
            # while identifying itself as a separate file
            process_and_split(child, child_id, child_label, node_id)
            
            # Create a lightweight reference for the current node's children list
            # "lazy": true tells frontend to fetch /data/{child_id}.json
            ref_node = {
                "id": child_id,
                "label": child_label,
                "lazy": True,
                # Include basic icons or descriptions if needed for preview?
                "description": child.get("description", ""),
                "children": [] # Important: Empty children in the reference
            }
            if "icon" in child:
                ref_node["icon"] = child["icon"]
                
            processed_children.append(ref_node)
            
        node_data["children"] = processed_children
    else:
        node_data["children"] = []

    # Save the FULL node data (with lazy references to children) to its own file
    save_json(node_data, f"{node_id}.json")

def main():
    ensure_dir(OUTPUT_DIR)
    
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading input file: {e}")
        return

    # Entry point: The 'after_10th' key in input_data.json
    if "after_10th" in data:
        root_content = data["after_10th"]
        
        # Start processing from after_10th
        # This will generate after_10th.json and all its descendants
        process_and_split(root_content, "after_10th", root_content.get("title", "After 10th"))
        
        # Create a root.json that points to after_10th
        root = {
            "id": "root",
            "label": "Career Explorer",
            "children": [
                 {
                    "id": "after_10th",
                    "label": "After 10th",
                    "lazy": True,
                    "description": root_content.get("description", "")
                 }
            ]
        }
        save_json(root, "root.json")
        
        print("Data processing complete.")
    else:
        print("Invalid input format: 'after_10th' key not found.")

if __name__ == "__main__":
    main()
