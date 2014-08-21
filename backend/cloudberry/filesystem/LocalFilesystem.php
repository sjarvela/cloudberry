<?php

namespace Cloudberry\Filesystem;

class LocalFilesystem implements Filesystem {
	private $rootFolder;

	public function __construct($rootFolder) {
		$this->rootFolder = $rootFolder;
	}

	public function getId() {
		return "local";
	}

	public function createItem($itemId) {
		$name = self::basename($itemId->path);
		if ($this->_isFolderPath($itemId->path)) {
			return new Folder($this, $itemId->id, $itemId->path, $name);
		} else {
			return new File($this, $itemId->id, $itemId->path, $name);
		}
	}

	/* operations */

	public function getChildren($folder) {
		$this->assertFolder($folder);

		$parentNativePath = $this->_getNativePath($folder);
		$items = scandir($parentNativePath);
		if (!$items) {
			throw new Cloudberry\CloudberryException("Invalid folder: ".$folder);
		}

		$result = array();
		foreach ($items as $i => $name) {
			if ($name == "." or $name == ".." or (strcmp(substr($name, 0, 1), '.') == 0)) {
				continue;
			}

			$nativePath = self::joinPath($parentNativePath, $name, FALSE);
			$isFolder = is_dir($nativePath);

			$internalPath = $this->_getInternalPath($nativePath);
			if ($isFolder) {
				$internalPath = self::folderPath($internalPath);
			}

			$id = ItemId::firstOrCreate(array('root_folder_id' => $this->rootFolder->id, "path" => $internalPath));//TODO cache

			if (!$isFolder) {
				$result[] = new File($this, $id->id, $internalPath, $name);
			} else {
				$result[] = new Folder($this, $id->id, $internalPath, $name);
			}
		}

		return $result;
	}

	/* tools */

	private function assertFile($item) {
		$this->assertFS($item);
		if (!$item->isFile()) {
			throw new Cloudberry\CloudberryException("Not a file: ".$item);
		}
	}

	private function assertFolder($item) {
		$this->assertFS($item);
		if ($item->isFile()) {
			throw new Cloudberry\CloudberryException("Not a folder: ".$item);
		}
	}

	private function assertFS($item) {
		if ($item->fs !== $this) {
			throw new Cloudberry\CloudberryException("FS does not match: ".$item."/".$this);
		}
	}

	private function _getNativePath($item) {
		$p = $item->path;
		str_replace(DIRECTORY_SEPARATOR, Filesystem::DIRECTORY_SEPARATOR, $p);
		return self::joinPath($this->rootFolder->path, $p, FALSE);
	}

	private function _getInternalPath($nativeFullPath) {
		$p = substr($nativeFullPath, strlen($this->rootFolder->path));
		str_replace(Filesystem::DIRECTORY_SEPARATOR, DIRECTORY_SEPARATOR, $p);
		return $p;
	}

	private function _isFolderPath($path, $internal = TRUE) {
		$n = trim($path);
		return (substr($n, -1) == ($internal?Filesystem::DIRECTORY_SEPARATOR:DIRECTORY_SEPARATOR));
	}

	public static function folderPath($path, $internal = TRUE) {
		$sp = $internal?Filesystem::DIRECTORY_SEPARATOR:DIRECTORY_SEPARATOR;
		return rtrim($path, $sp).$sp;
	}

	public static function joinPath($p1, $p2, $internal = TRUE) {
		$sp = $internal?Filesystem::DIRECTORY_SEPARATOR:DIRECTORY_SEPARATOR;
		return rtrim($p1, $sp).$sp.$p2;
	}

	public static function basename($path, $internal = TRUE) {
		if ($internal) {
			$name = strrchr(rtrim($path, Filesystem::DIRECTORY_SEPARATOR), Filesystem::DIRECTORY_SEPARATOR);
		} else {

			$name = strrchr(rtrim($path, DIRECTORY_SEPARATOR), DIRECTORY_SEPARATOR);
		}

		if (!$name) {
			return "";
		}

		return substr($name, 1);
	}

	public function __toString() {
		return "Local filesystem (".$this->rootFolder.")";
	}
}